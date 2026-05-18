import storageConfig from "~~/config/storage";
import type { Storage, StorageValue } from "unstorage";

type AppStorage = Storage<StorageValue> & {
    temporaryUrl: (path: string, expiresAt?: Date) => Promise<string>;
    url: (path: string) => string;
};

const storage = useStorage("private") as AppStorage;

const storagePublic = useStorage("public") as AppStorage;

storage.temporaryUrl = storageConfig.private.temporaryUrl;
storage.url = storageConfig.private.url;
storagePublic.temporaryUrl = storageConfig.public.temporaryUrl;
storagePublic.url = storageConfig.public.url;

export default storage;
export { storage, storagePublic };
