import { injectable } from "tsyringe";
import { Message } from "../schemas/Message";

@injectable()
class GetMessagesByChatoRoomService {
  async execute(chatRoomId: string) {
    const messages = await Message.find({
      chatRoomId,
    }).populate("from");
    return messages;
  }
}

export { GetMessagesByChatoRoomService };
