import { Injectable, NotFoundException } from '@nestjs/common';
import { Book } from './book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BookService {
    constructor(
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
    ) { }

    async getBook(bookId: string): Promise<Book> {
        const book = await this.bookRepository.findOne({ where: { id: bookId } });
        if (!book) {
            throw new NotFoundException('Book not found');
        }
        return book;
    }

    async isBookInStock(bookId: string, quantity: number): Promise<boolean> {
        const book = await this.bookRepository.findOne({ where: { id: bookId } });
        if (!book) {
            return false;
        }
        return quantity <= book.stock;
    }

    async decreaseStock(bookId: string, quantity: number): Promise<Book> {
        const book = await this.bookRepository.findOne({ where: { id: bookId } });

        if (!book) {
            throw new NotFoundException('Book not found');
        }
        book.stock -= quantity;
        const updatedBook = await this.bookRepository.save(book);
        return updatedBook;
    }

    async increaseStock(bookId: string, quantity: number): Promise<Book> {
        const book = await this.bookRepository.findOne({ where: { id: bookId } });

        if (!book) {
            throw new NotFoundException('Book not found');
        }

        console.log('Increasing stock for book:', book);
        book.stock += quantity;
        const updatedBook = await this.bookRepository.save(book);
        return updatedBook;
    }
}