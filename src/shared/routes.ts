import Chat from '../components/Chat'
import MainLayout from '../components/MainLayout'
import Login from '../components/Login'
import SignUp from '../components/SignUp'
import queries from './queries'

export default [
    {
        path: '/',
        component: MainLayout,
        indexRoute: { component: Chat, queries: queries, },
        childRoutes: [
            // Unrestricted Routes
            { path: '/login', component: Login },
            { path: '/sign_up', component: SignUp },
        ]
    }
]
