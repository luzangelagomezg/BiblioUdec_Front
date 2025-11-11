import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Declaración de tipos para Strophe.js
declare const Strophe: any;

export interface ChatMessage {
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  isOutgoing: boolean;
}

export interface ConnectionStatus {
  connected: boolean;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class XmppService {
  private connection: any;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>({
    connected: false,
    status: 'disconnected'
  });

  public messages$: Observable<ChatMessage[]> = this.messagesSubject.asObservable();
  public connectionStatus$: Observable<ConnectionStatus> = this.connectionStatusSubject.asObservable();

  private currentUsername: string = '';
  private adminJID: string = 'admin@bibliotecaudec.online'; // JID del administrador

  constructor() {}

  /**
   * Conectar al servidor XMPP
   * @param username - Usuario XMPP (ej: usuario@bibliotecaudec.online)
   * @param password - Contraseña del usuario XMPP
   * @param boshUrl - URL del servicio BOSH (ej: http://xmpp.bibliotecaudec.online/http-bind)
   */
  connect(username: string, password: string, boshUrl: string = 'http://xmpp.bibliotecaudec.online/http-bind') {
    this.currentUsername = username;
    
    // Crear conexión con Strophe
    this.connection = new Strophe.Connection(boshUrl);
    
    // Habilitar logs en desarrollo
    // this.connection.rawInput = (data: any) => console.log('RECV:', data);
    // this.connection.rawOutput = (data: any) => console.log('SEND:', data);

    // Conectar al servidor
    this.connection.connect(username, password, (status: number) => {
      this.onConnectionStatusChange(status);
    });
  }

  /**
   * Manejar cambios en el estado de conexión
   */
  private onConnectionStatusChange(status: number) {
    const statusMap: { [key: number]: string } = {
      [Strophe.Status.CONNECTING]: 'Conectando...',
      [Strophe.Status.CONNFAIL]: 'Falló la conexión',
      [Strophe.Status.AUTHENTICATING]: 'Autenticando...',
      [Strophe.Status.AUTHFAIL]: 'Falló la autenticación',
      [Strophe.Status.CONNECTED]: 'Conectado',
      [Strophe.Status.DISCONNECTED]: 'Desconectado',
      [Strophe.Status.DISCONNECTING]: 'Desconectando...',
    };

    const statusText = statusMap[status] || 'Estado desconocido';
    console.log('Estado XMPP:', statusText);

    if (status === Strophe.Status.CONNECTED) {
      this.connectionStatusSubject.next({ connected: true, status: statusText });
      // Configurar manejadores de mensajes
      this.connection.addHandler(
        (msg: any) => this.onMessage(msg),
        null,
        'message',
        'chat'
      );
      // Enviar presencia
      const pres = Strophe.$pres ? Strophe.$pres() : new Strophe.Builder('presence');
      this.connection.send(pres);
    } else if (status === Strophe.Status.DISCONNECTED) {
      this.connectionStatusSubject.next({ connected: false, status: statusText });
    } else {
      this.connectionStatusSubject.next({ 
        connected: false, 
        status: statusText 
      });
    }
  }

  /**
   * Manejar mensajes entrantes
   */
  private onMessage(msg: any): boolean {
    const to = msg.getAttribute('to');
    const from = msg.getAttribute('from');
    const type = msg.getAttribute('type');
    const body = msg.getElementsByTagName('body');

    if (type === 'chat' && body.length > 0) {
      const messageText = Strophe.getText(body[0]);
      
      const chatMessage: ChatMessage = {
        from: Strophe.getBareJidFromJid(from),
        to: Strophe.getBareJidFromJid(to),
        body: messageText,
        timestamp: new Date(),
        isOutgoing: false
      };

      // Agregar mensaje a la lista
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, chatMessage]);
    }

    return true; // Mantener el manejador activo
  }

  /**
   * Enviar mensaje al administrador
   */
  sendMessageToAdmin(messageText: string) {
    this.sendMessage(this.adminJID, messageText);
  }

  /**
   * Enviar mensaje a un usuario específico
   */
  sendMessage(to: string, messageText: string) {
    if (!this.connection || !this.connection.connected) {
      console.error('No hay conexión XMPP activa');
      return;
    }

    // Crear mensaje usando Strophe.$msg o Strophe.Builder
    let message;
    if (Strophe.$msg) {
      message = Strophe.$msg({
        to: to,
        from: this.connection.jid,
        type: 'chat'
      }).c('body').t(messageText);
    } else {
      // Fallback usando Builder directamente
      message = new Strophe.Builder('message', {
        to: to,
        from: this.connection.jid,
        type: 'chat'
      }).c('body').t(messageText);
    }

    this.connection.send(message);

    // Agregar mensaje enviado a la lista local
    const chatMessage: ChatMessage = {
      from: Strophe.getBareJidFromJid(this.connection.jid),
      to: Strophe.getBareJidFromJid(to),
      body: messageText,
      timestamp: new Date(),
      isOutgoing: true
    };

    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, chatMessage]);
  }

  /**
   * Desconectar del servidor XMPP
   */
  disconnect() {
    if (this.connection && this.connection.connected) {
      this.connection.disconnect();
    }
    this.messagesSubject.next([]);
  }

  /**
   * Obtener el JID del administrador
   */
  getAdminJID(): string {
    return this.adminJID;
  }

  /**
   * Configurar el JID del administrador
   */
  setAdminJID(jid: string) {
    this.adminJID = jid;
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.connection && this.connection.connected;
  }

  /**
   * Limpiar mensajes
   */
  clearMessages() {
    this.messagesSubject.next([]);
  }
}
