import Ui from "../Components/Ui/Ui";
import Head from "next/head";
import UploadModal from "../Components/UploadModal";
export default function Home() {
  return (
    <>
      <Head>
        <title>Sizar13</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-screen h-screen p-0 m-0">
        <Ui Children={<UploadModal />}></Ui>
      </div>
    </>
  );
}
