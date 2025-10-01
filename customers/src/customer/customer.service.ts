import { Injectable, NotFoundException } from '@nestjs/common';
import { Customer } from './customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    async findAll(): Promise<Customer[]> {
        console.log('[lms][customer][service][findall] - fetching all customers from repository');
        return await this.customerRepository.find();
    }

    async getCustomer(customerId: string): Promise<Customer | null> {
        console.log(`[lms][customer][service][getcustomer] - fetching customer with id: ${customerId}`);
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
        });
        if (!customer) {
            console.error(`[lms][customer][service][getcustomer] - customer not found with id: ${customerId}`);
            throw new NotFoundException('Customer not found');
        }
        return customer;
    }

    async createCustomer(data: Partial<Customer>): Promise<Customer> {
        console.log('[lms][customer][service][createcustomer] - creating customer', data);
        const customer = this.customerRepository.create(data);
        return await this.customerRepository.save(customer);
    }

    async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
        console.log(`[lms][customer][service][updatecustomer] - updating customer with id: ${id}`, data);
        const customer = await this.customerRepository.findOne({ where: { id } });
        if (!customer) {
            console.error(`[lms][customer][service][updatecustomer] - customer not found with id: ${id}`);
            throw new NotFoundException('Customer not found');
        }
        Object.assign(customer, data);
        return await this.customerRepository.save(customer);
    }

    async deleteCustomer(id: string): Promise<{ deleted: boolean }> {
        console.log(`[lms][customer][service][deletecustomer] - deleting customer with id: ${id}`);
        const result = await this.customerRepository.delete(id);
        return { deleted: result.affected === 1 };
    }
}
