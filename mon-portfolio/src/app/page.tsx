import Accueil from "./sections/Accueil";
import APropos from "./sections/APropos";
import MesProjets from "./sections/MesProjets";
import Contact from "./sections/Contact";

export default function Home() {
    return (
        <>
            <Accueil />
            <APropos />
            <MesProjets />
            <Contact />
        </>
    );
}
