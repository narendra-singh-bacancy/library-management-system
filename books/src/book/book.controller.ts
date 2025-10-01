import { Controller, Get, Post, Put, Delete, Inject, Param, Body, Patch } from '@nestjs/common';
import { BookService } from './book.service';
import {
    ClientProxy,
    Payload,
    MessagePattern,
    EventPattern,
} from '@nestjs/microservices';
import { Book } from './book.entity';

const GET_BOOK = 'getBook';
const IS_BOOK_IN_STOCK = 'isBookInStock';
const DECREASE_STOCK = 'DecreaseStock';
const INCREASE_STOCK = 'IncreaseStock';

@Controller('book')
export class BookController {
    constructor(private readonly bookService: BookService) {}

    // REST endpoints for CRUD
    @Get()
    async findAll() {
        console.log('[lms][book][controller][findAll] - fetching all books');
        return await this.bookService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        console.log(`[lms][book][controller][findOne] - fetching book with id: ${id}`);
        return await this.bookService.getBook(id);
    }

    @Post()
    async create(@Body() body: Partial<Book>) {
        console.log('[lms][book][controller][create] - creating new book', body);
        return await this.bookService.createBook(body);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() body: Partial<Book>) {
        console.log(`[lms][book][controller][update] - updating book with id: ${id}`, body);
        return await this.bookService.updateBook(id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        console.log(`[lms][book][controller][remove] - deleting book with id: ${id}`);
        return await this.bookService.deleteBook(id);
    }

    // Existing microservice endpoints
    @MessagePattern(GET_BOOK)
    async handleGetBook(@Payload() data: { bookId: string }) {
        console.log(`[lms][book][controller][handleGetBook] - microservice request for bookId: ${data.bookId}`);
        const { bookId } = data;
        return await this.bookService.getBook(bookId);
    }

    @MessagePattern(IS_BOOK_IN_STOCK)
    async handleIsBookInStock(
        @Payload() data: { bookId: string; quantity: number },
    ): Promise<boolean> {
        console.log(`[lms][book][controller][handleIsBookInStock] - microservice request for bookId: ${data.bookId}, quantity: ${data.quantity}`);
        const { bookId, quantity } = data;
        return await this.bookService.isBookInStock(bookId, quantity);
    }

    @EventPattern(DECREASE_STOCK)
    async handleDecreaseStock(
        @Payload() data: { bookId: string; quantity: number },
    ): Promise<Book> {
        console.log(`[lms][book][controller][handleDecreaseStock] - microservice event for bookId: ${data.bookId}, quantity: ${data.quantity}`);
        const { bookId, quantity } = data;
        return await this.bookService.decreaseStock(bookId, quantity);
    }

    @Patch('/:id')
    async increaseStock(
        @Param('id') bookId: string,
        @Body() body: { quantity: number },
    ) {
        console.log(`[lms][book][controller][increaseStock] - increasing stock for bookId: ${bookId}, quantity: ${body.quantity}`);
        const { quantity } = body;
        return await this.bookService.increaseStock(bookId, quantity);
    }
}