import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { XmppService, ChatMessage, ConnectionStatus } from '../services/xmpp.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  newMessage: string = '';
  connectionStatus: ConnectionStatus = { connected: false, status: 'disconnected' };
  
  // Configuración XMPP
  xmppUsername: string = '';
  xmppPassword: string = '12345678';
  boshUrl: string = 'ws://xmpp.bibliotecaudec.online:5280/xmpp-websocket';
  adminJID: string = 'admin@xmpp.bibliotecaudec.online';
  
  showConnectionForm: boolean = false;
  isMinimized: boolean = true;
  autoConnecting: boolean = false;
  
  // Variables para admin
  isAdmin: boolean = false;
  conversations: Map<string, ChatMessage[]> = new Map();
  activeConversation: string | null = null;
  conversationsList: string[] = [];

  private messagesSubscription?: Subscription;
  private statusSubscription?: Subscription;

  constructor(
    private xmppService: XmppService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Obtener usuario actual
    const currentUser = this.authService.getCurrentUser();
    
    // Verificar si es admin
    this.isAdmin = currentUser?.role === 'admin';
    
    // Suscribirse a mensajes
    this.messagesSubscription = this.xmppService.messages$.subscribe(
      (messages) => {
        if (this.isAdmin) {
          // Organizar mensajes por conversación
          this.organizeConversations(messages);
        } else {
          // Usuario normal: mostrar todos los mensajes
          this.messages = messages;
        }
        // Auto-scroll al final
        setTimeout(() => this.scrollToBottom(), 100);
      }
    );

    // Suscribirse a estado de conexión
    this.statusSubscription = this.xmppService.connectionStatus$.subscribe(
      (status) => {
        this.connectionStatus = status;
        if (status.connected) {
          this.showConnectionForm = false;
        }
      }
    );

    // Configurar JID del admin
    this.xmppService.setAdminJID(this.adminJID);

    // Conectar automáticamente
    if (currentUser && currentUser.name) {
      // Generar username XMPP: nombre en minúsculas con guiones en lugar de espacios
      const xmppUser = currentUser.name.toLowerCase().replace(/\s+/g, '-');
      this.xmppUsername = `${xmppUser}@xmpp.bibliotecaudec.online`;
      
      // Conectar automáticamente
      this.autoConnecting = true;
      this.connect();
    }
  }

  ngOnDestroy() {
    this.messagesSubscription?.unsubscribe();
    this.statusSubscription?.unsubscribe();
    this.disconnect();
  }

  /**
   * Conectar al servidor XMPP
   */
  connect() {
    if (!this.xmppUsername || !this.xmppPassword) {
      alert('Por favor ingrese usuario y contraseña XMPP');
      return;
    }

    this.xmppService.connect(this.xmppUsername, this.xmppPassword, this.boshUrl);
    this.autoConnecting = false;
  }

  /**
   * Desconectar del servidor XMPP
   */
  disconnect() {
    this.xmppService.disconnect();
    this.showConnectionForm = false;
  }

  /**
   * Enviar mensaje
   */
  sendMessage() {
    if (!this.newMessage.trim()) {
      return;
    }

    if (!this.connectionStatus.connected) {
      alert('No hay conexión activa con el servidor XMPP');
      return;
    }

    if (this.isAdmin && this.activeConversation) {
      // Admin responde a un usuario específico
      this.xmppService.sendMessage(this.activeConversation, this.newMessage);
    } else {
      // Usuario normal envía al admin
      this.xmppService.sendMessageToAdmin(this.newMessage);
    }
    
    this.newMessage = '';
  }

  /**
   * Organizar mensajes por conversación (solo para admin)
   */
  private organizeConversations(messages: ChatMessage[]) {
    this.conversations.clear();
    
    messages.forEach(msg => {
      // Determinar el contacto (el otro usuario en la conversación)
      const contact = msg.isOutgoing ? msg.to : msg.from;
      
      // Ignorar mensajes del admin consigo mismo
      if (contact === this.xmppUsername || contact.includes('admin')) {
        return;
      }
      
      if (!this.conversations.has(contact)) {
        this.conversations.set(contact, []);
      }
      
      this.conversations.get(contact)!.push(msg);
    });
    
    // Actualizar lista de conversaciones
    this.conversationsList = Array.from(this.conversations.keys());
    
    // Si hay una conversación activa, actualizar sus mensajes
    if (this.activeConversation && this.conversations.has(this.activeConversation)) {
      this.messages = this.conversations.get(this.activeConversation)!;
    } else if (this.conversationsList.length > 0 && !this.activeConversation) {
      // Seleccionar la primera conversación si no hay ninguna activa
      this.selectConversation(this.conversationsList[0]);
    }
  }

  /**
   * Seleccionar una conversación (solo para admin)
   */
  selectConversation(contact: string) {
    this.activeConversation = contact;
    this.messages = this.conversations.get(contact) || [];
    setTimeout(() => this.scrollToBottom(), 100);
  }

  /**
   * Obtener nombre del usuario desde JID
   */
  getUsernameFromJID(jid: string): string {
    return jid.split('@')[0].replace(/-/g, ' ');
  }

  /**
   * Obtener último mensaje de una conversación
   */
  getLastMessage(contact: string): string {
    const msgs = this.conversations.get(contact);
    if (!msgs || msgs.length === 0) return 'Sin mensajes';
    
    const lastMsg = msgs[msgs.length - 1];
    return lastMsg.body.substring(0, 50) + (lastMsg.body.length > 50 ? '...' : '');
  }

  /**
   * Verificar si hay mensajes no leídos (simplificado)
   */
  hasUnreadMessages(contact: string): boolean {
    const msgs = this.conversations.get(contact);
    if (!msgs || msgs.length === 0) return false;
    
    // Simplificación: considera no leído si el último mensaje es entrante
    const lastMsg = msgs[msgs.length - 1];
    return !lastMsg.isOutgoing;
  }

  /**
   * Manejar Enter en textarea
   */
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Scroll al final del chat
   */
  private scrollToBottom() {
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  /**
   * Minimizar/Maximizar chat
   */
  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
  }

  /**
   * Mostrar formulario de conexión
   */
  showConnectionSettings() {
    this.showConnectionForm = true;
  }

  /**
   * Limpiar historial de mensajes
   */
  clearMessages() {
    if (confirm('¿Desea limpiar el historial de mensajes?')) {
      this.xmppService.clearMessages();
    }
  }

  /**
   * Actualizar JID del administrador
   */
  updateAdminJID(jid: string) {
    this.adminJID = jid;
    this.xmppService.setAdminJID(jid);
  }
}
