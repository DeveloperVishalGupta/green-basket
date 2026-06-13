import { useEffect } from "react";

const Adsense = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "flex", border: "1px solid #FFFEAA", margin: "20px 0", height: "9px !important" }}
      data-ad-client="ca-pub-1700292067500977"
      data-ad-slot="1234567890"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};

export default Adsense;