import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 text-center">
                    <div className="bg-red-500/10 p-4 rounded-full mb-4">
                        <AlertTriangle className="h-10 w-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Algo deu errado</h1>
                    <p className="text-muted-foreground max-w-md mb-6">
                        Encontramos um erro inesperado. Tente recarregar a página.
                    </p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="gap-2"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Recarregar Aplicação
                    </Button>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <div className="mt-8 p-4 bg-black/40 rounded border border-white/10 text-left max-w-2xl w-full overflow-auto">
                            <p className="font-mono text-xs text-red-400">
                                {this.state.error.toString()}
                            </p>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
