import Head from "next/head";
import dynamic from 'next/dynamic';

const SurveyComponent = dynamic(() => import("@/components/Survey"), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>My First Survey</title>
        <meta name="description" content="SurveyJS React Form Library" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "40px 16px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "900px", // 👈 最大幅をここで設定
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            padding: "24px",
          }}
        >
          <SurveyComponent />
        </div>
      </main>
    </>
  );
}