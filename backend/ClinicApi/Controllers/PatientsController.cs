using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
[ApiController]
[Route("api/patients")]
public class PatientsController : ControllerBase
{
    // every action here now requires a valid JWT
}