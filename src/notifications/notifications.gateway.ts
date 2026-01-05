import {
    OnGatewayConnectionm
    OnGateWayDisconnect,
    WebSocketGateway,
    WebSockerServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*', //lembrar de mudar quando for pra produção
    },
})
