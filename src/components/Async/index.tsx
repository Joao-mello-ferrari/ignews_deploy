import { useEffect, useState } from "react"

export function Async(){
  const [visible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 1000);
  },[]);

  return(
    <div>
      <span>Hello World</span>
      {visible && <span>Wait to enter screen</span>}
      {!visible && <span>Wait to exit screen</span>}
    </div>
  )
}