export default function Contact() {
    return (
        <section id="contact" className="px-6 py-20 bg-gray-900 text-center text-white">
            <h3 className="text-3xl font-bold mb-6">Contact</h3>
            <p className="text-gray-300 mb-6">
                Tu veux collaborer ou discuter d’un projet ?
            </p>
            <a
                href="mailto:hediokbapro@gmail.com"
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 rounded-lg font-semibold transition-colors"
            >
                Me contacter
            </a>
        </section>
    );
}
