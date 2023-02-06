import { injectable } from "tsyringe";
import { ChatRoom } from "../schemas/ChatRoom";
import { User } from "../schemas/User";

@injectable()
class GetUserBySocketIdService {
  async execute(socket_id: String) {
    const user = await User.findOne({
      socket_id,
    });

    return user;
  }
}

export { GetUserBySocketIdService };
