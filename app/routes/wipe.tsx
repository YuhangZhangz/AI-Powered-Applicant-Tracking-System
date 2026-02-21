import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
    const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadFiles = async () => {
        const files = (await fs.readDir("./")) as FSItem[];
        setFiles(files);
    };

    useEffect(() => {
        loadFiles();
    }, []);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isLoading, auth.isAuthenticated]);

    const handleDelete = async () => {
        if (isDeleting) return;
        setIsDeleting(true);
        try {
            await Promise.all(
                files.map((file) => fs.delete(file.path))
            );
            await kv.flush();
            await loadFiles();
        } finally {
            setIsDeleting(false);
        }
};

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error {error}</div>;
    }

    return (
        <div>
            Authenticated as: {auth.user?.username}
            <div>Existing files:</div>
            <div className="flex flex-col gap-4">
                {files.map((file) => (
                    <div key={file.id} className="flex flex-row gap-4">
                        <p>{file.name}</p>
                    </div>
                ))}
            </div>
            <div>
                <button
                    disabled={isDeleting}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer disabled:opacity-50"
                    onClick={handleDelete}
                >
                    {isDeleting ? "Wiping..." : "Wipe App Data"}
                </button>
            </div>
        </div>
    );
};

export default WipeApp;