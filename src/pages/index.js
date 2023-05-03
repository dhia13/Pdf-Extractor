import Head from "next/head";
import PdfEditor from "../PdfEditor";
export default function Home() {
  return (
    <>
      <Head>
        <title>Pdf Editor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-screen h-screen p-0 m-0">
        <PdfEditor />
      </div>
    </>
  );
}
