import { injectable } from "tsyringe";
import { Message } from "../schemas/Message";

interface CreateMessageDTO {
  from: string;
  text: string;
  chatRoomId: string;
}

@injectable()
class CreateMessageService {
  async execute({ from, text, chatRoomId }: CreateMessageDTO) {
    const message = await Message.create({
      from,
      text,
      chatRoomId,
    });

    return message;
  }
}

export { CreateMessageService };
