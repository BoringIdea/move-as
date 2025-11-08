import { Injectable, OnModuleInit } from '@nestjs/common';
import { SuiClient, getFullnodeUrl, EventId } from '@mysten/sui/client';
import { bcs } from '@mysten/bcs';
import { db } from '../db/db';
import { sql, eq, desc, or } from 'drizzle-orm';
import { sui_schemas, sui_attestations } from 'src/db/schema';

type NewSuiSchema = typeof sui_schemas.$inferInsert;
type NewSuiAttestation = typeof sui_attestations.$inferInsert;

const PACKAGE_ID = process.env.SUI_PACKAGE_ID;

@Injectable()
export class SuiService implements OnModuleInit {
  private suiClient: SuiClient;

  constructor() {
    if (!PACKAGE_ID) {
      throw new Error('SUI_PACKAGE_ID environment variable is required but not set');
    }
    
    this.suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
  }

  onModuleInit() {
    this.startListening();
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async startListening() {
    console.log('start listening sui');
    console.log(`Using SUI_PACKAGE_ID: ${PACKAGE_ID}`);
    
    while (true) {
      try {
        await Promise.all([
          this.schemaCreatedEvents(),
          this.attestationCreatedEvents(),
        ]);
      } catch (error) {
        console.error('Error fetching events', error);
      }
      await this.sleep(1000);
    }
  }

  private async schemaCreatedEvents() {
    let nextPage = true;
    let cursor: EventId | undefined;
    const queryOptions: any = {
      query: {
        MoveEventType: `${PACKAGE_ID}::schema::SchemaCreated`,
      },
      limit: 100,
    };
    
    while (nextPage) {
      if (cursor) {
        queryOptions.cursor = cursor;
      }
      const { data, hasNextPage, nextCursor } =
        await this.suiClient.queryEvents(queryOptions);

      cursor = nextCursor;
      nextPage = hasNextPage;

      for (const event of data) {
        const parsedJson = event.parsedJson as any;
        const schemaDataString = bcs
          .string()
          .parse(new Uint8Array(parsedJson.schema))
          .toString();
        const schema = {
          address: parsedJson.schema_address,
          name: parsedJson.name,
          description: parsedJson.description,
          url: parsedJson.url,
          creator: parsedJson.creator,
          created_at: parsedJson.created_at,
          schema: schemaDataString,
          revokable: parsedJson.revokable,
          resolver: parsedJson.event_type == 1 ? true : false,
          admin_cap: parsedJson.admin_cap || '0x0',
          tx_hash: event.id.txDigest,
        };

        if (await this.findSchemaByAddress(schema.address)) {
          continue;
        }
        await this.createSchema(schema);
      }
    }
  }

  private async attestationCreatedEvents() {
    let nextPage = true;
    let cursor: EventId | undefined;
    while (nextPage) {
      const { data, hasNextPage, nextCursor } =
        await this.suiClient.queryEvents({
          query: {
            MoveEventType: `${PACKAGE_ID}::attestation::AttestationCreated`,
          },
          cursor: cursor,
          limit: 100,
        });

      cursor = nextCursor;
      nextPage = hasNextPage;

      for (const event of data) {
        const parsedJson = event.parsedJson as any;
        const attestationDataString = bcs
          .string()
          .parse(new Uint8Array(parsedJson.data))
          .toString();
        const attestation = {
          address: parsedJson.id,
          schema: parsedJson.schema,
          ref_attestation: parsedJson.ref_attestation,
          time: parsedJson.time,
          expiration_time: parsedJson.expiration_time,
          revocation_time: '0',
          revokable: parsedJson.revokable,
          attestor: parsedJson.attestor,
          recipient: parsedJson.recipient,
          data: attestationDataString,
          name: parsedJson.name,
          description: parsedJson.description,
          url: parsedJson.url,
          tx_hash: event.id.txDigest,
        };

        if (await this.findAttestationByAddress(attestation.address)) {
          continue;
        }
        await this.createAttestation(attestation);
      }
    }
  }

  async createAttestation(attestation: NewSuiAttestation) {
    await db.insert(sui_attestations).values(attestation);
  }

  async findAttestationByAddress(address: string) {
    return await db.query.sui_attestations.findFirst({
      where: eq(sui_attestations.address, address),
    });
  }

  async attestationCount() {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(sui_attestations);
    return result[0].count as number;
  }

  async getAttestations(offset: number, limit: number) {
    return await db.query.sui_attestations.findMany({
      offset,
      limit,
      orderBy: desc(sui_attestations.id),
    });
  }

  async getAttestationsWithSchemas(offset: number, limit: number) {
    return await db
      .select({
        // attestation fields
        address: sui_attestations.address,
        schema: sui_schemas.schema,
        time: sui_attestations.time,
        attestor: sui_attestations.attestor,
        recipient: sui_attestations.recipient,
        tx_hash: sui_attestations.tx_hash,
        // schema fields
        schema_id: sui_schemas.id,
        schema_name: sui_schemas.name,
        schema_address: sui_schemas.address,
      })
      .from(sui_attestations)
      .leftJoin(sui_schemas, eq(sui_schemas.address, sui_attestations.schema))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(sui_attestations.id));
  }

  async getAttestationsBySchema(schema: string, offset: number, limit: number) {
    return await db
      .select({
        // attestation fields
        address: sui_attestations.address,
        schema: sui_schemas.schema,
        time: sui_attestations.time,
        attestor: sui_attestations.attestor,
        recipient: sui_attestations.recipient,
        tx_hash: sui_attestations.tx_hash,
        // schema fields
        schema_id: sui_schemas.id,
        schema_name: sui_schemas.name,
        schema_address: sui_schemas.address,
        schema_data: sui_schemas.schema,
      })
      .from(sui_attestations)
      .leftJoin(sui_schemas, eq(sui_schemas.address, sui_attestations.schema))
      .limit(limit)
      .offset(offset)
      .where(eq(sui_schemas.address, schema))
      .orderBy(desc(sui_attestations.id));
  }

  async getAttestationsByUser(address: string, offset: number, limit: number) {
    return await db
      .select({
        // attestation fields
        address: sui_attestations.address,
        schema: sui_schemas.schema,
        time: sui_attestations.time,
        attestor: sui_attestations.attestor,
        recipient: sui_attestations.recipient,
        tx_hash: sui_attestations.tx_hash,
        // schema fields
        schema_id: sui_schemas.id,
        schema_name: sui_schemas.name,
        schema_address: sui_schemas.address,
        schema_data: sui_schemas.schema,
      })
      .from(sui_attestations)
      .leftJoin(sui_schemas, eq(sui_schemas.address, sui_attestations.schema))
      .limit(limit)
      .offset(offset)
      .where(
        or(
          eq(sui_attestations.attestor, address),
          eq(sui_attestations.recipient, address),
        ),
      )
      .orderBy(desc(sui_attestations.id));
  }

  async createSchema(schema: NewSuiSchema) {
    await db.insert(sui_schemas).values(schema);
  }

  async findSchemaByAddress(address: string) {
    const res = await db
      .select({
        id: sui_schemas.id,
        address: sui_schemas.address,
        name: sui_schemas.name,
        schema: sui_schemas.schema,
        creator: sui_schemas.creator,
        revokable: sui_schemas.revokable,
        resolver: sui_schemas.resolver,
        created_at: sui_schemas.created_at,
        tx_hash: sui_schemas.tx_hash,
        attestation_cnt: sql<number>`COUNT(${sui_attestations.id})`,
      })
      .from(sui_schemas)
      .leftJoin(
        sui_attestations,
        eq(sui_attestations.schema, sui_schemas.address),
      )
      .where(eq(sui_schemas.address, address))
      .groupBy(
        sui_schemas.id,
        sui_schemas.address,
        sui_schemas.name,
        sui_schemas.schema,
        sui_schemas.creator,
        sui_schemas.revokable,
        sui_schemas.resolver,
        sui_schemas.created_at,
        sui_schemas.tx_hash,
      );
    return res[0];
  }

  async searchSchema(searchInput: string) {
    const res = await db
      .select()
      .from(sui_schemas)
      .where(
        or(
          eq(sql`CAST(${sui_schemas.id} AS TEXT)`, searchInput as string),
          eq(sui_schemas.address, searchInput),
        ),
      );
    return res;
  }

  async getAttestationAndSchema(address: string) {
    const res = await db
      .select({
        // attestation fields
        id: sui_attestations.id,
        address: sui_attestations.address,
        schema: sui_schemas.schema,
        ref_attestation: sui_attestations.ref_attestation,
        time: sui_attestations.time,
        expiration_time: sui_attestations.expiration_time,
        revocation_time: sui_attestations.revocation_time,
        revokable: sui_attestations.revokable,
        attestor: sui_attestations.attestor,
        recipient: sui_attestations.recipient,
        data: sui_attestations.data,
        tx_hash: sui_attestations.tx_hash,
        // schema fields
        schema_id: sui_schemas.id,
        schema_name: sui_schemas.name,
        schema_address: sui_schemas.address,
        schema_data: sui_schemas.schema,
      })
      .from(sui_attestations)
      .leftJoin(sui_schemas, eq(sui_schemas.address, sui_attestations.schema))
      .where(eq(sui_attestations.address, address));
    return res[0];
  }

  async schemaCount() {
    const result = await db.select({ count: sql`count(*)` }).from(sui_schemas);
    return result[0].count as number;
  }

  async getSchemas(offset: number, limit: number) {
    return await db
      .select({
        id: sui_schemas.id,
        address: sui_schemas.address,
        name: sui_schemas.name,
        schema: sui_schemas.schema,
        revokable: sui_schemas.revokable,
        resolver: sui_schemas.resolver,
        created_at: sui_schemas.created_at,
        attestation_cnt: sql<number>`COUNT(${sui_attestations.id})`,
      })
      .from(sui_schemas)
      .leftJoin(
        sui_attestations,
        eq(sui_attestations.schema, sui_schemas.address),
      )
      .groupBy(
        sui_schemas.id,
        sui_schemas.address,
        sui_schemas.name,
        sui_schemas.schema,
        sui_schemas.revokable,
        sui_schemas.resolver,
        sui_schemas.created_at,
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(sui_schemas.id));
  }

  async getSchemaCreatorCnt() {
    const result = await db
      .select({
        count: sql`COUNT(DISTINCT ${sui_schemas.creator})`,
      })
      .from(sui_schemas);
    return result[0].count as number;
  }

  async getAttestorCount() {
    const result = await db
      .select({
        count: sql`COUNT(DISTINCT ${sui_attestations.attestor})`,
      })
      .from(sui_attestations);
    return result[0].count as number;
  }

  async getSchemaCount() {
    const result = await db.select({ count: sql`count(*)` }).from(sui_schemas);
    return result[0].count as number;
  }

  async getAttestationCount() {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(sui_attestations);
    return result[0].count as number;
  }

  async getAttestationCntBySchema(schema: string) {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(sui_attestations)
      .where(eq(sui_attestations.schema, schema));
    return result[0].count as number;
  }

  async getAttestationCntByUser(address: string) {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(sui_attestations)
      .where(
        or(
          eq(sui_attestations.attestor, address),
          eq(sui_attestations.recipient, address),
        ),
      );
    return result[0].count as number;
  }

  async getAttestationCntByCreator(address: string) {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(sui_attestations)
      .where(eq(sui_attestations.attestor, address));
    return result[0].count as number;
  }

  async getAttestationCntByRecipient(address: string) {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(sui_attestations)
      .where(eq(sui_attestations.recipient, address));
    return result[0].count as number;
  }
}
