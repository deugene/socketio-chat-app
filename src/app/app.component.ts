import { Component, OnInit } from '@angular/core';

import * as io from 'socket.io-client';
import * as $ from 'jquery';
import { Chat } from './chat';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Chat App';
  chatApp: Chat;
  $messages: any;
  currentRoom: string;
  userInput: string;
  roomsList = [];

  ngOnInit() {
    const socket = io.connect();
    this.chatApp = new Chat(socket);
    this.$messages = $('#messages');

    socket.on('nameResult', (result): void => {
      this.appendMessage(
        this.divSystemContentElement(
          result.success
            ? 'You are now known as ' + result.name + '.'
            : result.message
        )
      );
    });

    socket.on('joinResult', (result): void => {
      if (result.success) {
        this.currentRoom = result.room;
        result.message = 'Room changed.';
      }
      this.appendMessage(this.divSystemContentElement(result.message));
    });

    socket.on('message', (message): void => {
      message = this.divEscapedContentElement(message.text);
      if (this.$messages.scrollTop() + this.$messages.height() <
          this.$messages.prop('scrollHeight')) {
        this.$messages.append(message);
        return;
      }
      this.appendMessage(message);
    });

    socket.on('rooms', (rooms) => this.roomsList = rooms);

    setInterval(() => socket.emit('rooms'), 1000);

    $('#send-message').focus();
  }

  joinByClick(room: string): void {
    this.chatApp.processCommand('/join ' + room);
    $('#send-message').focus();
  }

  onSubmit(): void {
    const isMessage = this.userInput.charAt(0) !== '/';
    const systemMessage = this.chatApp.processCommand(
      (isMessage ? '/send ' : '') + this.userInput,
      this.currentRoom
    );
    this.appendMessage(() => {
      return systemMessage ?
        this.divSystemContentElement(systemMessage) :
        isMessage ? this.divEscapedContentElement(this.userInput) : null;
    });

    this.userInput = '';
  }

  divEscapedContentElement(message: string) {
    return $('<div>').text(message);
  }

  divSystemContentElement(message: string) {
    return $('<div>').append('<i>' + message + '</i>');
  }

  appendMessage(element): void {
    this.$messages
      .append(element)
      .scrollTop(this.$messages.prop('scrollHeight'));
  }

}
