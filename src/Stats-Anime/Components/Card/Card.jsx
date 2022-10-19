import { Link } from "react-router-dom";
import "./CardStyle.scss";
import placeholderImage from "../../logo/default-placeholder.png";

export const Card = ({
  mal_id,
  path,
  image_url,
  mainTitle,
  subTitle,
  animeType,
}) => {
  return (
    <>
      <Link to={path ? path + `/${mal_id}` : ``} className="cards" key={mal_id}>
        <img
          src={image_url}
          alt=""
          onError={(e) => (e.currentTarget.src = placeholderImage)}
        />
        {animeType && <h3 className="type">{animeType}</h3>}

        <div className="details-char">
          <h5
            style={
              path === "/anime"
                ? {
                    padding: "1em 0",
                  }
                : null
            }
          >
            {mainTitle}
          </h5>
          {subTitle && <h5>{subTitle}</h5>}
        </div>
      </Link>
    </>
  );
};
