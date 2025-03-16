import { Link } from 'react-router';

export default function MajorsInCollege({ college }) {
    return(
        <div style={{"marginBottom":"30px"}}>
            <h3>{ college.name }</h3>
            {
                college.majors.map((major, i) => (
                    <div key={i}
                         style={{ display: 'flex', marginBottom: '8px' }}
                    >
                        <span style={{ width: '90px', flexShrink: 0 }}>
                            {major.id}
                        </span>
                        <Link 
                            to={`/majors/${major.id}`} 
                            style={{ textDecoration: 'none' }}
                        >
                            {major.name}
                        </Link>
                    </div>
                ))}
        </div>
    )
}