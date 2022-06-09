import { useEffect, useState } from "react";

export default function usePolling<Type>(interval: number, notReadyResponse: string, serverErrorResponses: Array<string>,  call: (...a0: any[]) => Promise<Type>, params: any[]): [Type | undefined, boolean, boolean] {
    const [resource, setResource] = useState<Type | undefined>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);


    useEffect(() => {
        async function getRes() {
            try {
                const response: any = await call(...params);
                
                if (response === notReadyResponse) {
                    setTimeout(() => {
                        getRes();
                    }, interval)
                } else if (serverErrorResponses.includes(response)) {
                    setError(true);
                } else {
                    setResource(response);
                }
            } catch (err: any) {
                setError(true);
            }
        }

        getRes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (resource != undefined)
            setLoading(false);
    }, [resource]);

    return [ resource, loading, error ];
}