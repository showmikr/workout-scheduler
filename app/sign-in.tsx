import { Pressable, Text, View } from 'react-native';
import { useSession } from '../ctx';
import { Redirect } from 'expo-router';
import { TokenResponse } from 'expo-auth-session';
import { Link } from 'expo-router';

export default function SignIn() {
    const { fakeSignIn, signIn, session, isLoading } = useSession();

    return isLoading ? (
        <View className="flex-1 items-center justify-center">
            <Text className="text-3xl dark:text-white">Loading...</Text>
        </View>
    ) : !session ? (
        <View className="flex-1 items-center justify-center dark:bg-black">
            <Text className="text-3xl dark:text-white">
                Session:{' '}
                {session
                    ? (JSON.parse(session) as TokenResponse).idToken
                    : 'null'}
            </Text>
            <Text />
            <Text className="dark:text-white">
                {'session loading state: ' + isLoading}
            </Text>
            <Pressable
                onPress={() => {
                    // Uncomment signIn when ready to use real AWS Cognito sign-in functionality
                    //signIn();
                    fakeSignIn();
                    // Navigate after signing in. You may want to tweak this to ensure sign-in is
                    // successful before navigating.
                    //router.replace("/"); // Not really working, read the readme
                }}
            >
                <Text className="dark:text-white text-3xl">Sign In</Text>
            </Pressable>
            <Text> </Text>
            <Text> </Text>
            <Link href="/graph">
                <Text className="p-1 dark:text-white text-xl">{'> '}</Text>
                <Text className="p-1 dark:text-white text-xl">graph-page</Text>
                <Text className="p-1 dark:text-white text-xl">{' <'}</Text>
            </Link>
        </View>
    ) : (
        <Redirect href="/" />
    );
}
