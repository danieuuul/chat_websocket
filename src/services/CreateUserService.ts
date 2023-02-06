import { injectable } from "tsyringe";
import { User } from "../schemas/User";

interface CreateUserDTO {
  email: string;
  socket_id: string;
  avatar: string;
  name: string;
}

@injectable()
class CreateUserService {
  async execute({ email, socket_id, avatar, name }: CreateUserDTO) {
    const userAlreadyExists = await User.findOne({
      email,
    });
    let user: User;
    if (userAlreadyExists) {
      user = await User.findOneAndUpdate(
        {
          _id: userAlreadyExists._id,
        },
        {
          $set: { socket_id, avatar, name },
        },
        {
          new: true,
        }
      );
    } else {
      user = await User.create({
        email,
        socket_id,
        avatar,
        name,
      });
    }
    return user;
  }
}

export { CreateUserService };
