export class Chat {
  commands = {
    send(text: string, room: any): void {
      this.socket.emit('message', {
        room: room,
        text: text
      });
    },
    join(newRoom: any): void {
      this.socket.emit('join', { newRoom: newRoom });
    },
    nick(name: any): void {
      this.socket.emit('nameAttempt', name);
    }
  };

  constructor(public socket: any) { }

  processCommand(text: string, room?: any): string {
    let split = text.indexOf(' ');
    let command = this.commands[text.slice(1, split++).toLowerCase()];
    if (typeof command === 'function') {
      command = command.bind(this);
      return command(text.slice(split), room);
    }
    return 'Unrecognized command.';
  }

}
