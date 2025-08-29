import { FadeLoader } from "react-spinners";
export default function Loader(){
    return (
        <div className="text-center mt-11">
            <FadeLoader loading={true}/>
        </div>
    )
}