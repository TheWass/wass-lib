import { primitive } from '../helpers/helpers.js';

/** List node */
type Node = {
	/** resolve promise */
	resolve: (value: void | PromiseLike<void>) => void
	/** next node pointer */
	next?: Node
    /** Should only be run if the size == 1 */
    exclusive: boolean
}

/** This is a semaphore with an optional key */
export class Semaphore {
    private static semaphoreMap = new Map() as Map<NonNullable<primitive>, Semaphore>;
    private size = 0;
    private head: Node | undefined;
    private tail: Node | undefined;
    private key: NonNullable<primitive>;
    private concurrency: number;

    private constructor(key: NonNullable<primitive>, concurrency: number) {
        this.key = key;
        this.concurrency = concurrency;
    }

    /** If you pass in a key, it will find that semaphore and link it up.  If you do not pass in a key, one will be generated for you. */
    public static get(key: NonNullable<primitive> = Symbol(), concurrency = 1) {
        if (Semaphore.semaphoreMap.has(key)) {
            return Semaphore.semaphoreMap.get(key)!;
        }
        const instance = new Semaphore(key, concurrency);
        Semaphore.semaphoreMap.set(key, instance);
        return instance;
    }

    /** Setting exclusive means it will ensure all other semaphores for that key have completed before starting.  This has no effect if concurrency is 1. */
    public acquire(exclusive: boolean = false) {
        if (++this.size <= (exclusive ? 1 : this.concurrency)) {
            return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
            // Add the promise to the chain.
            if (this.head != null && this.tail != null) {
                this.tail = this.tail.next = { resolve, exclusive };
            } else {
                this.tail = this.head = { resolve, exclusive };
            }
        });
    }
    public release() {
        this.size -= 1;
        let node = this.head;
        let prev = this.head;
        while (node?.exclusive && this.size > 1) {
            // move to the next and run.
            prev = node;
            node = node?.next;
        }
        // fire off the next promise, and pop it out of the chain.
        node?.resolve();
        if (this.head != node && prev != null) {
            prev.next = node?.next;
        } else {
            this.head = this.head?.next;
        }
        if (this.size <= 0) {
            Semaphore.semaphoreMap.delete(this.key);
        }
    }

    public getSize() {
        return this.size;
    }
}
