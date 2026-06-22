using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicApi.Migrations
{
    /// <inheritdoc />
    public partial class SeparateFullNameFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Patients",
                newName: "MiddleName");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Patients",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "Patients",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "Patients",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "Patients");

            migrationBuilder.RenameColumn(
                name: "MiddleName",
                table: "Patients",
                newName: "Name");
        }
    }
}
