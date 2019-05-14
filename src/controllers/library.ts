import { Response, Request } from 'express'
import { RedisApi, RequestWithInteractionTokens } from '../types'
import * as ISBN from 'node-isbn';
import {
    bookList,
    password
} from '../config'
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet';

const retrieveBook = async (did: string, redis: RedisApi) => JSON.parse(await redis.getAsync(did));
const retrieveDID = async (isbn: number, redis: RedisApi) => await redis.getAsync(isbn.toString());

const getBooks = (
    redis: RedisApi
) => async (
    req: Request,
    res: Response
) =>
        Promise.all(bookList.map(async (isbn) => await retrieveBook(await retrieveDID(isbn, redis), redis)))
            .then(books => res.send(books))
            .catch(err => res.status(500).send(err))

const getBookDetails = (
    redis: RedisApi
) => async (
    req: Request,
    res: Response
) =>
        retrieveBook(req.params.did, redis)
            .then(book => res.send(book))
            .catch(err => res.status(404).send(err))

const getRentReq = (
    redis: RedisApi,
    id: IdentityWallet
) => async (
    req: Request,
    res: Response
) => {

    }

const rentBook = (
    redis: RedisApi,
    id: IdentityWallet
) => async (
    req: RequestWithInteractionTokens,
    res: Response
) => {
    }

const populateDB = (
    redis: RedisApi
) => async (
    bookList: Array<{
        isbn: number,
        idw: IdentityWallet
    }>
) => {
        bookList.map(book => ISBN.resolve(book.isbn)
            .then(async (bookDetails) => {
                const dbBook = await redis.getAsync(book.idw.did)
                if (!dbBook || !dbBook.length) {
                    bookDetails.available = true
                    bookDetails.did = book.idw.did
                    await redis.setAsync(book.idw.did, JSON.stringify(bookDetails))
                }
                const dbDID_ISBN = await redis.getAsync(book.isbn.toString())
                if (!dbDID_ISBN || !dbDID_ISBN.length) {
                    await redis.setAsync(book.isbn.toString(), book.idw.did)
                }
            })
            .catch(console.error))
    }

export const library = {
    getBooks,
    getBookDetails,
    getRentReq,
    rentBook,
    populateDB
}
