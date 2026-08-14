export default function SectionTitle({ title, meta }: { title: string; meta: string }) {
    return (
        <div className="section-title">
            <h2>{title}</h2>
            <span>{meta}</span>
        </div>
    );
}