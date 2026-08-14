import { Mail, MapPin } from "lucide-react";

const EMAIL = "xemishra@gmail.com";
const ADDRESS = "Gurgaon, Haryana, IN";

export default function Footer() {
    return (
        <footer>
            <span>© {new Date().getFullYear()} Shivanand Mishra</span>
            <div className="footer-contact">
                <a href={`mailto:${EMAIL}`}>
                    <Mail size={12} /> {EMAIL}
                </a>
                <span>
                    <MapPin size={12} /> {ADDRESS}
                </span>
            </div>
        </footer>
    )
}