
import Image from 'next/image';
import Header from "../component/Header";
import Footer from "../component/Footer";

export default function UserPage() {
  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-24 relative">
      <Header />

      {/* 이미지와 텍스트 섹션 */}
      <div className="flex items-center mb-8">
        <Image
          src="/WLD.png" // 이미지 파일 경로
          alt="WLD Logo"
          width={50}
          height={50}
          className="mr-2"
        />
        <p className="text-2xl font-bold">월드코인 앱을 이용하여 로그인하세요</p>
      </div>

      {/* 중앙 QR 코드 영역 */}
      <div className="border-2 border-gray-400 p-8 mb-8">
        <p className="text-4xl">QR</p>
      </div>

      {/* QR 코드 아래의 텍스트 */}
      <div className="mb-8">
        <p className="text-m text-gray-500">또는 코드를 이용하여 로그인</p>
      </div>

      {/* 하단 숫자 코드를 표시하는 네모 박스 */}
      <div className="text-center">
        <div className="border-2 border-gray-400 px-4 py-2 rounded mb-4">
          <p className="text-lg">1234-5678-9101</p>
        </div>
        <p className="text-sm"></p>
      </div>

      <Footer />
    </div>
  );
}
