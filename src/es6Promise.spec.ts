import { assert } from 'chai';
import { describe, it } from 'mocha';

describe('ES6Promise', () => {
    it('Executes when called with no then', () => {
        const willExecute = () => {
            return new Promise<void>((resolve) => {
                assert(true);
                resolve();
            });
        };
        // Note, there is no .then function, but we still assert(true)
        willExecute();
    });

    it('Does not execute when passed', () => {
        const doNotExecute = () => {
            return new Promise<void>((resolve) => {
                assert.fail('Promise executed :(');
                resolve();
            });
        };
        const passToFunction = (func: () => Promise<void>) => {
            assert(typeof func == 'function');
            // You can now call func() to call the promise.
        };
        passToFunction(doNotExecute);
    });

    it('Executes in order', (done) => {
        let ExecCounter = 0;
        const promiseFactory = (callback: () => void) => {
            return new Promise<void>((resolve) => {
                assert(++ExecCounter == 2, 'Second');
                resolve();
            }).then(() => {
                assert(++ExecCounter == 4, 'Fourth');
                return callback();
            }).then(() => {
                assert(++ExecCounter == 6, 'Sixth');
            });
        };

        assert(++ExecCounter == 1, 'First');
        promiseFactory(() => {
            assert(++ExecCounter == 5, 'Fifth');
        }).then(() => {
            assert(++ExecCounter == 7, 'Seventh');
            done();
        });
        assert(++ExecCounter == 3, 'Third');
    });

    it('Also Executes in order', (done) => {
        let ExecCounter = 0;
        assert(++ExecCounter == 1, 'First');
        const promise = new Promise<void>((resolve) => {
            assert(++ExecCounter == 2, 'Second');
            resolve();
            assert(++ExecCounter == 3, 'Third');
        }).then(async () => {
            assert(++ExecCounter == 6, 'Sixth');
            await new Promise((resolve) => setTimeout(resolve, 10));
            assert(++ExecCounter == 7, 'Seventh');
        });
        assert(++ExecCounter == 4, 'Fourth');
        promise.finally(() => {
            assert(++ExecCounter == 8, 'Eighth');
        });
        promise.then(() => {
            assert(++ExecCounter == 9, 'Nineth');
            done();
        });
        assert(++ExecCounter == 5, 'Fifth');
    });

    it('Does not execute on Then', (done) => {
        let ExecCounter = 0;
        const promise = new Promise<void>((resolve) => {
            assert(++ExecCounter == 1);
            resolve();
        });
        // Notice, it executes when it is created, not when then is called.
        assert(ExecCounter == 1);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        promise;
        assert(ExecCounter == 1);
        promise.then();
        assert(ExecCounter == 1);
        promise.then(() => done());
    });

    it('Does not Then twice', (done) => {
        let ThenCounter = 0;
        let ResolveCounter = 0;
        const promise = new Promise<void>((resolve) => {
            setTimeout(() => {
                ++ResolveCounter;
                resolve();
            }, 0);
            setTimeout(() => {
                ++ResolveCounter;
                resolve();
            }, 0);
        });
        promise.then(() => {
            ++ThenCounter;
        });
        setTimeout(() => {
            assert(ThenCounter == 1);
            assert(ResolveCounter == 2);
            done();
        }, 5);
    });

    it('Does not Catch twice', (done) => {
        let CatchCounter = 0;
        let RejectCounter = 0;
        const promise = new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                ++RejectCounter;
                reject();
            }, 0);
            setTimeout(() => {
                ++RejectCounter;
                reject();
            }, 0);
        });
        promise.catch(() => {
            ++CatchCounter;
        });
        setTimeout(() => {
            assert(CatchCounter == 1);
            assert(RejectCounter == 2);
            done();
        }, 5);
    });

    it('Does not Catch after Resolving', (done) => {
        let ThenCounter = 0;
        let CatchCounter = 0;
        let ResolveCounter = 0;
        let RejectCounter = 0;
        const promise = new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                ++ResolveCounter;
                resolve();
            }, 0);
            setTimeout(() => {
                assert(ResolveCounter == 1);
                ++RejectCounter;
                reject();
            }, 1);
        });
        promise.then(() => {
            ++ThenCounter;
        }).catch(() => {
            ++CatchCounter;
        });
        setTimeout(() => {
            assert(ThenCounter == 1);
            assert(CatchCounter == 0);
            assert(ResolveCounter == 1);
            assert(RejectCounter == 1);
            done();
        }, 5);
    });

    it('Does not Then after Rejecting', (done) => {
        let ThenCounter = 0;
        let CatchCounter = 0;
        let ResolveCounter = 0;
        let RejectCounter = 0;
        const promise = new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                ++RejectCounter;
                reject();
            }, 0);
            setTimeout(() => {
                assert(RejectCounter == 1);
                ++ResolveCounter;
                resolve();
            }, 1);
        });
        promise.then(() => {
            ++ThenCounter;
        }).catch(() => {
            ++CatchCounter;
        });
        setTimeout(() => {
            assert(ThenCounter == 0);
            assert(CatchCounter == 1);
            assert(ResolveCounter == 1);
            assert(RejectCounter == 1);
            done();
        }, 5);
    });
});
