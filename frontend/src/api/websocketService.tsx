let socket: WebSocket | null = null;

interface WebSocketCallbacks {
    onOpen?: () => void;
    onMessage?: (data: { light1State: string; light2State: string }) => void;
    onError?: (error: Event) => void;
    onClose?: (event: CloseEvent) => void;
}

export const connectWebSocket = (
    url: string,
    callbacks: WebSocketCallbacks,
): void => {
    if (
        socket &&
        (socket.readyState === WebSocket.OPEN ||
            socket.readyState === WebSocket.CONNECTING)
    ) {
        console.log("WebSocket is already connected or connecting.");
        return;
    }

    socket = new WebSocket(url);
    console.log(`Attempting to connect to WebSocket: ${url}`);

    socket.onopen = () => {
        console.log("WebSocket Connected");
        if (callbacks.onOpen) {
            callbacks.onOpen();
        }
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data as string);
            // console.log("WebSocket message received:", data);
            if (callbacks.onMessage) {
                callbacks.onMessage(data);
            }
        } catch (error) {
            console.error(
                "Error parsing WebSocket message:",
                error,
                "Raw data:",
                event.data,
            );
        }
    };

    socket.onerror = (error) => {
        console.error("WebSocket Error:", error);
        if (callbacks.onError) {
            callbacks.onError(error);
        }
    };

    socket.onclose = (event) => {
        console.log(
            "WebSocket Disconnected. Code:",
            event.code,
            "Reason:",
            event.reason,
        );
        if (callbacks.onClose) {
            callbacks.onClose(event);
        }
        socket = null;
    };
};

export const disconnectWebSocket = (): void => {
    if (socket) {
        console.log("Closing WebSocket connection explicitly.");
        socket.close();
        socket = null;
    }
};
