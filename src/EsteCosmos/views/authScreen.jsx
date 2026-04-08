import { useState } from 'react';
import { useAuth } from '@/firebase';
import {
    signInAnonymously,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { Rocket, Loader2, Stars } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import styles from '../views/authScreen.module.css';

/**
 * Auth screen with login / signup tabs and anonymous sign-in
 */
export function AuthScreen() {
    const auth = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const[authTab, setAuthTab] = useState('login'); // login | sign up


    /**
     * @param {React.FormEvent<HTMLFormElement>} e
     * @param {'login'|'signup'} type
     */
    const handleAuth = async (e, type) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            if (type === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
            }else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        }
    }
}