// executeCode.js
import { callService } from '../HA_API/api';

export async function executeCode(command: string) {
  const entity = process.env.NEXT_PUBLIC_ENTITY;
  command = command.trim();
  try {

    switch (command) {
      case 'toggleAirPurifier':
        callService( "fan", "toggle", { entity_id: entity } );
       
        break;
      case 'togglefan':
        
        break;
      // 추가 명령을 여기다 작성하세요
      default:
        throw new Error('Unknown command');
    }

    
  } catch (error) {
    console.error('Error executing code:', error);
  }
}
