import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { HttpException, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            { name: 'academy', url: process.env.ACADEMY_GQL_ADDRESS },
            { name: 'crm', url: process.env.CRM_GQL_ADDRESS },
          ],
        }),
        buildService: ({ name, url }) => {
          return new RemoteGraphQLDataSource({
            url,
            async willSendRequest({ request, context }: any) {
              if (
                request.query ===
                'query __ApolloGetServiceDefinition__ { _service { sdl } }'
              )
                return;
              const publicPath = process.env.PUBLIC_QUERY_MUTATIONS?.split(',') || [];
              for (const path of publicPath) {
                if (request.query.indexOf(`{${path}(`) >= 0) return;
              }
              const token = context.req?.headers['authorization']?.split(' ')[1];
              if (!token) throw new HttpException('You need to pass authorization header', 403);
              const authResult = await AppService.auth(token);
              if (!authResult) throw new HttpException('unauthorized access', 406);
              request.http.headers.set('authorization', context.req?.headers['authorization']);
            },
          });
        },
      },
    }),
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule { }
