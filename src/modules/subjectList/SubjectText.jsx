import { Link } from 'react-router-dom';

export default function SubjectText({subject}) {
    return (
        <div style={{
            "display":"flex",
            "flexDirection":"row"
        }}>
            <div style={{
                "marginRight":"10px"
            }}>
                <p>{subject.code}</p>
            </div>

            <Link to={`/subjects/${subject.id}`}>
                <p>{subject.formalName}</p>
            </Link>
        </div>
    )

}