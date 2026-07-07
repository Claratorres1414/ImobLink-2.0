export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type RootStackParamList = {
    Feed: undefined;

    PostDetails: {
        post: any;
    }

    UserProfile: {
        user: any;
        imageProfile: string | null;
    };

    CreateNewPost: undefined;

    Search: undefined;

    MyProfile: undefined;

    Followers: {
        user: any;
    }

    Followings: {
        user: any;
    }
}