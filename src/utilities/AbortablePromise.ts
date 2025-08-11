/**
 * This pairs an ES6 promise and the AbortController together.
 * Useful where you need to stop the promise from continuing externally.
 * Note:  Async/await will not work with this class.  Use `toAwaitable` get the promise directly.
 */
export class AbortablePromise<T> implements PromiseLike<T> {
    private abortController: AbortController;
    private promiseWrapper: Promise<T>;
    private cancelEvent!: (reason?: unknown) => void;

    public AbortSignal: AbortSignal;
    public then: Promise<T>['then'];
    public catch: Promise<T>['catch'];
    public finally: Promise<T>['finally'];

    constructor(source: Promise<T>, abortController?: AbortController) {
        this.abortController = abortController || new AbortController();
        this.AbortSignal = this.abortController.signal;
        this.promiseWrapper = new Promise<T>((resolve, reject) => {
            // This abuses a quirk where resolving/rejecting a promise the first time causes the promise to "stick".
            // It won't execute additional resolve/rejects after the first, however, the body of the promise will still run.
            this.cancelEvent = (reason: unknown = { isCanceled: true }) => reject(reason);
            source.then((val) => resolve(val)).catch((err) => reject(err));
        });
        // Rebind Promise functions.
        this.then = (callback) => this.promiseWrapper.then(callback);
        this.catch = (callback) => this.promiseWrapper.catch(callback);
        this.finally = (callback) => this.promiseWrapper.finally(callback);
    }

    /**
     * This will send the abort signal without rejecting the promise.
     * Use the assocated abortSignal to control the results outside of this object.
     */
    public abort(reason?: unknown) {
        this.abortController.abort(reason);
    }

    /**
     * This will cancel the promise by rejecting it immediately and trigger the abort signal.
     */
    public cancel(reason?: unknown) {
        this.cancelEvent(reason);
        this.abortController.abort(reason);
    }

    /** 
     * This will return the source promise, enabling the async/await structure.  
     * It is still cancelable.
     */
    public toAwaitable(): Promise<T> {
        return this.promiseWrapper;
    }
}
