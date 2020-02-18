/**
 * File information.
 */
export default class FileInfo {
    /**
     * Constructs a FileInfo.
     *
     * @param domain domain string
     * @param owner owner
     * @param repo repository name
     * @param ref ref
     * @param path file path
     */
    constructor(domain: string, owner: string, repo: string, ref: string, path: string) {
        this.domain = domain;
        this.owner = owner;
        this.repo = repo;
        this.ref = ref;
        this.path = path;
    }

    /**
     * Gets the URL to the raw file.
     *
     * @return URL to the raw file
     */
    getUrl(): string {
        return `https://${this.domain}/${this.owner}/${this.repo}/raw/${this.ref}/${this.path}`;
    }

    private domain: string;
    private owner: string;
    private repo: string;
    private ref: string;
    private path: string;
}
