export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type RootStackParamList = {
    Feed: undefined;

    PostDetails: {
        post: any;
    }

    CreateNewPost: undefined;

    MyProfile: undefined;
}