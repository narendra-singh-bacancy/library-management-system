import { Injectable } from '@nestjs/common';
import { Customer } from './customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    async getCustomer(customerId: string): Promise<Customer | null> {
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
        });
        return customer;
    }
}
