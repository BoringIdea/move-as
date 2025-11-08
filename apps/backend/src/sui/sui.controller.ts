import { Controller, Get, Query, Param } from '@nestjs/common';
import { SuiService } from './sui.service';

@Controller('sui')
export class SuiController {
  constructor(private readonly suiService: SuiService) {}

  @Get('schemas')
  async getSchemas(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ) {
    return this.suiService.getSchemas(offset, limit);
  }

  @Get('schema/:schemaAddress')
  async getSchema(@Param('schemaAddress') schemaAddress: string) {
    return this.suiService.findSchemaByAddress(schemaAddress);
  }

  @Get('search-schema')
  async searchSchema(@Query('searchInput') searchInput: string) {
    return this.suiService.searchSchema(searchInput);
  }

  @Get('schema-count')
  async getSchemaCount() {
    return this.suiService.getSchemaCount();
  }

  @Get('attestations')
  async getAttestations(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ) {
    return this.suiService.getAttestationsWithSchemas(offset, limit);
  }

  @Get('attestations/schema/:schema')
  async getAttestationsBySchema(
    @Param('schema') schema: string,
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ) {
    return this.suiService.getAttestationsBySchema(schema, offset, limit);
  }

  @Get('attestations/user/:address')
  async getAttestationsByUser(
    @Param('address') address: string,
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ) {
    return this.suiService.getAttestationsByUser(address, offset, limit);
  }

  @Get('attestation/:address')
  async getAttestation(@Param('address') address: string) {
    return this.suiService.getAttestationAndSchema(address);
  }

  @Get('attestation-count')
  async getAttestationCount() {
    return this.suiService.getAttestationCount();
  }

  @Get('attestation-cnt-by-schema/:schema')
  async getAttestationCntBySchema(@Param('schema') schema: string) {
    return this.suiService.getAttestationCntBySchema(schema);
  }

  @Get('attestation-cnt-by-user/:address')
  async getAttestationCntByUser(@Param('address') address: string) {
    return this.suiService.getAttestationCntByUser(address);
  }

  @Get('attestation-cnt-by-creator/:address')
  async getAttestationCntByCreator(@Param('address') address: string) {
    return this.suiService.getAttestationCntByCreator(address);
  }

  @Get('attestation-cnt-by-recipient/:address')
  async getAttestationCntByRecipient(@Param('address') address: string) {
    return this.suiService.getAttestationCntByRecipient(address);
  }

  @Get('attestor-count')
  async getAttestorCount() {
    return this.suiService.getAttestorCount();
  }

  @Get('schema-creator-cnt')
  async getSchemaCreatorCnt() {
    return this.suiService.getSchemaCreatorCnt();
  }
}
