export interface DBChat {
    _id: string;
    users: [string, string];
    createdOn: Date;
}

export interface DBChatMessage {
    _id: string;
    chatId: string;
    author: string;
    text: string;
    date: Date;
    visualized: boolean;
}