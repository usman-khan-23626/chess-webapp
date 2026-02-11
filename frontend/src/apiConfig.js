const getBackendUrl = () => {
    // Determine backend URL based on the current window's location.
    // This allows other devices on the network to access the same backend.
    const hostname = window.location.hostname;
    // Default to http if not specified
    return `http://${hostname}:9000`;
};

export const API_BASE_URL = getBackendUrl();
