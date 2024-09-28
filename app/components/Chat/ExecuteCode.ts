// executeCode.js
import { callService, getState } from '../HA_API/api';

export async function executeCode(command: string) {
  const entity = process.env.NEXT_PUBLIC_ENTITY;
  command = command.trim();
  try {

    switch (command) {
      case 'toggleAirPurifier':
        callService( "fan", "toggle", { entity_id: entity } );
       
        break;
      case 'getAirPurifier':
        const stateData = await getState("fan.zhimi_airpurifier_mb4");
        console.log("Fetched State:", stateData.state); // state 값만 출력
        
        break;
      // 추가 명령을 여기다 작성하세요
      default:
        throw new Error('Unknown command');
    }

    
  } catch (error) {
    console.error('Error executing code:', error);
  }
}
