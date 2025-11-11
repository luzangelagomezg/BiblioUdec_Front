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

  private messagesSubscription?: Subscription;
  private statusSubscription?: Subscription;

  constructor(
    private xmppService: XmppService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Suscribirse a mensajes
    this.messagesSubscription = this.xmppService.messages$.subscribe(
      (messages) => {
        this.messages = messages;
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

    // Obtener usuario actual y conectar automáticamente
    const currentUser = this.authService.getCurrentUser();
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

    this.xmppService.sendMessageToAdmin(this.newMessage);
    this.newMessage = '';
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
