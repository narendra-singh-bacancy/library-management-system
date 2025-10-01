import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Get()
  async findAll() {
    console.log('[lms][customer][controller][findall] - fetching all customers');
    return await this.customerService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log(`[lms][customer][controller][findone] - fetching customer with id: ${id}`);
    return await this.customerService.getCustomer(id);
  }

  @Post()
  async create(@Body() body: any) {
    console.log('[lms][customer][controller][create] - creating new customer', body);
    return await this.customerService.createCustomer(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    console.log(`[lms][customer][controller][update] - updating customer with id: ${id}`, body);
    return await this.customerService.updateCustomer(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    console.log(`[lms][customer][controller][remove] - deleting customer with id: ${id}`);
    return await this.customerService.deleteCustomer(id);
  }

  @MessagePattern('getCustomer')
  async handleGetCustomer(@Payload() data: { customerId: string }) {
    return await this.customerService.getCustomer(data.customerId);
  }
}