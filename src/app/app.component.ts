import { Component, OnInit } from '@angular/core';

import * as io from 'socket.io-client';
import { Chat } from './chat';

export interface Message {
  text: string;
  type: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Chat App';
  chatApp: Chat;
  currentRoom: string;
  userInput: string;
  roomsList = [];
  messages: Message[] = [];

  ngOnInit() {
    const socket = io.connect();
    this.chatApp = new Chat(socket);

    socket.on('nameResult', (result): void => {
      const text = result.success
        ? 'You are now known as ' + result.name + '.'
        : result.message;
      const message = {
        text: text,
        type: 'system'
      };
      this.messages.push(message);
      this.autoScroll();
    });

    socket.on('joinResult', (result): void => {
      if (result.success) {
        this.currentRoom = result.room;
        result.message = 'Room changed.';
      }
      this.messages.push({
        text: result.message,
        type: 'system'
      });
      this.autoScroll();
    });

    socket.on('message', (message): void => {
      this.messages.push({
        text: message.text,
        type: 'user'
      });
      const messages = document.getElementById('messages');
      if (messages.scrollHeight < messages.scrollTop + messages.offsetHeight) {
        this.autoScroll();
      }
    });

    socket.on('rooms', (rooms) => this.roomsList = rooms);
    setInterval(() => socket.emit('rooms'), 1000);
  }

  joinByClick(room: string): void {
    this.chatApp.processCommand('/join ' + room);
  }

  onSubmit(): void {
    const isMessage = !this.userInput.startsWith('/');
    const systemMessage = this.chatApp.processCommand(
      (isMessage ? '/send ' : '') + this.userInput,
      this.currentRoom
    );
    let message;
    if (systemMessage) {
      message = {
        text: systemMessage,
        type: 'system'
      };
    } else if (isMessage) {
      message = {
        text: this.userInput,
        type: 'user'
      };
    }
    if (message) {
      this.messages.push(message);
      this.autoScroll();
    }
    this.userInput = '';
  }

  autoScroll(): void {
    setTimeout(() => {
      const messages = document.getElementById('messages');
      messages.scrollTop = messages.scrollHeight;
    }, 10);
  }

}
