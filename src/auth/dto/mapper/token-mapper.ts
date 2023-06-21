import { IUser } from "../../../users/interface/user.interface";
import { ISession } from "../../../sessions/interface/session.interface";

export class TokenMapper {
    public static prepareAccessAndRefreshModel(model: IUser, model2: ISession) {
        return [
            {
                id: model._id,
            },
            {
                id: model._id,
                email: model.email,
                deviceId: model2.deviceId,
                lastActiveDate: model2.lastActiveDate,
            },
        ];
    }
}
