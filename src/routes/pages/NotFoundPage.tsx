import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="centered">
      <section className="card">
        <h2>Page not found</h2>
        <p>We couldn&apos;t find what you were looking for.</p>
        <button type="button" className="ghost" onClick={() => navigate(ROUTES.HOME)}>Go home</button>
      </section>
    </div>
  );
};
